########
# Copyright (c) 2014 GigaSpaces Technologies Ltd. All rights reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
############


import sys
import subprocess
import argparse
import platform
import os
import urllib
import tempfile
import logging
import shutil
import time
import tarfile
from threading import Thread
from contextlib import closing


DESCRIPTION = '''This script installs Cloudify's Composer on Linux and OS X.
This requires that you have Python 2.7, pip 1.5+ and virtualenv 12+ installed.
pip and virtualenv should be accessible within the $PATH.

The installation process requires an internet connection.
'''

IS_VIRTUALENV = hasattr(sys, 'real_prefix')

REQUIREMENT_FILE_NAMES = ['dev-requirements.txt', 'requirements.txt']

LINUX_NODEJS_SOURCE = 'http://nodejs.org/dist/v{0}/node-v{0}-linux-x64.tar.gz'.format('0.10.35')  # NOQA
OSX_NODEJS_SOURCE = 'https://nodejs.org/download/release/v{0}/node-v{0}-darwin-x64.tar.gz'.format('0.10.35')  # NOQA
DSL_PARSER_CLI_SOURCE = 'https://github.com/cloudify-cosmo/cloudify-dsl-parser-cli/archive/3.3.zip'  # NOQA
COMPOSER_SOURCE = 'https://s3.amazonaws.com/cloudify-ui/composer-builds/{0}/blueprintcomposer-{0}.tgz'.format('3.3.0')  # NOQA

PLATFORM = sys.platform
IS_WIN = (PLATFORM.startswith('win32'))
IS_DARWIN = (PLATFORM == 'darwin')
IS_LINUX = (PLATFORM.startswith('linux'))

PROCESS_POLLING_INTERVAL = 0.1

# defined below
lgr = None

if not (IS_LINUX or IS_DARWIN):
    sys.exit('Platform {0} not supported.'.format(PLATFORM))

major, minor, micro, _, _ = sys.version_info
if major != 2 and minor != 7:
    sys.exit('Python 2.7.x is required for this script to run. '
             'It seems you\'re running {0}.{1}.{2}.'.format(
                 major, minor, micro))


def init_logger(logger_name):
    logger = logging.getLogger(logger_name)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(fmt='%(asctime)s [%(levelname)s] '
                                      '[%(name)s] %(message)s',
                                  datefmt='%H:%M:%S')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


def run(cmd, suppress_errors=False):
    """Executes a command
    """
    lgr.debug('Executing: {0}...'.format(cmd))
    pipe = subprocess.PIPE
    proc = subprocess.Popen(
        cmd, shell=True, stdout=pipe, stderr=pipe)

    stderr_log_level = logging.NOTSET if suppress_errors else logging.ERROR

    stdout_thread = PipeReader(proc.stdout, proc, lgr, logging.DEBUG)
    stderr_thread = PipeReader(proc.stderr, proc, lgr, stderr_log_level)

    stdout_thread.start()
    stderr_thread.start()

    while proc.poll() is None:
        time.sleep(PROCESS_POLLING_INTERVAL)

    stdout_thread.join()
    stderr_thread.join()

    proc.aggr_stdout = stdout_thread.aggr
    proc.aggr_stderr = stderr_thread.aggr

    return proc


def _is_root():
    return os.getuid() == 0


def drop_root_privileges():
    """Drop root privileges

    This is used so that when installing cloudify within a virtualenv
    using sudo, the default behavior will not be to install using sudo
    as a virtualenv is created especially so that users don't have to
    install in the system Python or using a Sudoer.
    """
    # maybe we're not root
    if not _is_root():
        return

    lgr.info('Dropping root permissions...')
    os.setegid(int(os.environ.get('SUDO_GID', 0)))
    os.seteuid(int(os.environ.get('SUDO_UID', 0)))


def make_virtualenv(virtualenv_dir, python_path='sys.executable'):
    """This will create a virtualenv. If no `python_path` is supplied,
    will assume that `python` is in path. This default assumption is provided
    via the argument parser.
    """
    lgr.info('Creating Virtualenv {0}...'.format(virtualenv_dir))
    result = run('virtualenv -p {0} {1}'.format(python_path, virtualenv_dir))
    if not result.returncode == 0:
        sys.exit('Could not create virtualenv: {0}'.format(virtualenv_dir))


def install_module(module, version=False, pre=False, virtualenv_path=False,
                   wheels_path=False, requirement_files=None, upgrade=False):
    """This will install a Python module.

    Can specify a specific version.
    Can specify a prerelease.
    Can specify a virtualenv to install in.
    Can specify a list of paths or urls to requirement txt files.
    Can specify a local wheels_path to use for offline installation.
    Can request an upgrade.
    """
    lgr.info('Installing {0}...'.format(module))
    pip_cmd = ['pip', 'install']
    if virtualenv_path:
        pip_cmd[0] = os.path.join(
            _get_env_bin_path(virtualenv_path), pip_cmd[0])
    if requirement_files:
        for req_file in requirement_files:
            pip_cmd.extend(['-r', req_file])
    module = '{0}=={1}'.format(module, version) if version else module
    pip_cmd.append(module)
    if wheels_path:
        pip_cmd.extend(
            ['--use-wheel', '--no-index', '--find-links', wheels_path])
    if pre:
        pip_cmd.append('--pre')
    if upgrade:
        pip_cmd.append('--upgrade')
    if IS_VIRTUALENV and not virtualenv_path:
        lgr.info('Installing within current virtualenv: {0}...'.format(
            IS_VIRTUALENV))
    result = run(' '.join(pip_cmd))
    if not result.returncode == 0:
        lgr.error(result.aggr_stdout)
        sys.exit('Could not install module: {0}.'.format(module))


def untar_requirement_files(archive, destination):
    """This will extract requirement files from an archive.
    """
    with tarfile.open(name=archive) as tar:
        req_files = [req_file for req_file in tar.getmembers()
                     if os.path.basename(req_file.name)
                     in REQUIREMENT_FILE_NAMES]
        tar.extractall(path=destination, members=req_files)


def download_file(url, destination):
    lgr.info('Downloading {0} to {1}'.format(url, destination))
    final_url = urllib.urlopen(url).geturl()
    if final_url != url:
        lgr.debug('Redirected to {0}'.format(final_url))
    f = urllib.URLopener()
    f.retrieve(final_url, destination)


def get_os_props():
    distro, _, release = platform.linux_distribution(
        full_distribution_name=False)
    return distro, release


def _get_env_bin_path(env_path):
    """returns the bin path for a virtualenv
    """
    try:
        import virtualenv
        return virtualenv.path_locations(env_path)[3]
    except ImportError:
        # this is a fallback for a race condition in which you're trying
        # to use the script and create a virtualenv from within
        # a virtualenv in which virtualenv isn't installed and so
        # is not importable.
        return os.path.join(env_path, 'scripts' if IS_WIN else 'bin')


class PipeReader(Thread):
    def __init__(self, fd, proc, logger, log_level):
        Thread.__init__(self)
        self.fd = fd
        self.proc = proc
        self.logger = logger
        self.log_level = log_level
        self.aggr = ''

    def run(self):
        while self.proc.poll() is None:
            output = self.fd.readline()
            if len(output) > 0:
                self.aggr += output
                self.logger.log(self.log_level, output)
            else:
                time.sleep(PROCESS_POLLING_INTERVAL)


def untar(archive, destination):
    """Extracts files from an archive to a destination folder.
    """
    lgr.debug('Extracting tar.gz {0} to {1}...'.format(archive, destination))
    with closing(tarfile.open(name=archive)) as tar:
        files = [f for f in tar.getmembers()]
        tar.extractall(path=destination, members=files)


class ComposerInstaller():

    _root = os.path.abspath(os.sep)
    HOME = os.path.join(_root, 'opt', 'cloudify-composer')
    NODEJS_HOME = os.path.join(HOME, 'nodejs')
    COMPOSER_HOME = os.path.join(HOME, 'blueprint-composer')
    DSL_PARSER_HOME = os.path.join(HOME, 'cloudify-dsl-parser')

    def __init__(self, composer_source=COMPOSER_SOURCE, uninstall=False,
                 nodejs_source=LINUX_NODEJS_SOURCE if IS_LINUX
                 else OSX_NODEJS_SOURCE,
                 dsl_cli_source=DSL_PARSER_CLI_SOURCE):
        if IS_WIN:
            sys.exit('This installer does not currently support installing '
                     'the composer on Windows.')

        self.uninstall = uninstall
        self.nodejs_source = nodejs_source
        self.dsl_cli_source = dsl_cli_source
        self.composer_source = composer_source

    def execute(self):
        if not self._find_pip:
            lgr.error('pip 1.5+ must be installed for the composer to '
                      'install correctly. Please install pip and try again.')
        if not self._find_virtualenv:
            lgr.error('virtualenv 12+ must be installed for the composer to '
                      'install correctly. Please install virtualenv and try '
                      'again.')
        if self.uninstall:
            lgr.info('Uninstalling Cloudify Blueprint Composer.')
            sys.exit(self.remove_all())

        if os.path.isdir(self.HOME):
            action = raw_input(
                '{0} already exists. Would you like to continue with the '
                'installation? (This will remove previous folders and files.) '
                '(yes/no):'.format(self.HOME))
            if action in ('y', 'yes'):
                lgr.debug('Cleaning previous Composer files and folders.')
                shutil.rmtree(self.HOME)
            else:
                sys.exit(lgr.info('Installation aborted.'))
        self.install_nodejs()
        self.install_composer()
        self.install_dsl_parser()
        lgr.info(
            'You can now run: '
            'sudo {0}/bin/node '
            '{1}/package/server.js '
            'to run Cloudify Blueprint Composer.'.format(
                self.NODEJS_HOME, self.COMPOSER_HOME))

    def is_url(self, source):
        if '://' in source:
            split = source.split('://')
            schema = split[0]
            if schema in ['http', 'https']:
                return True
            else:
                lgr.error('Source URL type {0} is not supported'.format(
                    schema))
                sys.exit('Unsupported URL type (must be http or https).')
        elif os.path.isfile(source):
            return False
        else:
            lgr.error('Source {0} could not be found'.format(source))
            sys.exit(1)

    def install_nodejs(self):
        def extract(archive, destination):
            untar(archive, destination)
            source = os.path.join(
                td, [d for d in os.walk(destination).next()[1]][0])
            for obj in os.listdir(source):
                shutil.move(os.path.join(source, obj), self.NODEJS_HOME)

        td = tempfile.mkdtemp()
        if self.is_url(self.nodejs_source):
            fd, tf = tempfile.mkstemp()
            os.close(fd)
            if not os.path.isdir(self.NODEJS_HOME):
                os.makedirs(self.NODEJS_HOME)
            try:
                download_file(self.nodejs_source, tf)
                extract(tf, td)
            finally:
                shutil.rmtree(td)
                os.remove(tf)
        else:
            untar(self.nodejs_source, td)

    def install_dsl_parser(self):
        make_virtualenv(self.DSL_PARSER_HOME)
        install_module(
            self.dsl_cli_source, virtualenv_path=self.DSL_PARSER_HOME)

    def install_composer(self):
        if self.is_url(self.composer_source):
            fd, tf = tempfile.mkstemp()
            os.close(fd)
            if not os.path.isdir(self.COMPOSER_HOME):
                os.makedirs(self.COMPOSER_HOME)
            try:
                download_file(self.composer_source, tf)
                untar(tf, self.COMPOSER_HOME)
            finally:
                os.remove(tf)
        else:
            untar(self.composer_source, self.COMPOSER_HOME)

    def remove_all(self):
        action = raw_input(
            'Note that this will remove the following: \n'
            '{0}\n{1}\n{2}\n'
            'Are you should you want to continue? (yes/no): '.format(
                self.NODEJS_HOME,
                self.COMPOSER_HOME,
                self.DSL_PARSER_HOME)).lower()

        if action in ('y', 'yes'):
            if os.path.isdir(self.HOME):
                lgr.debug('Removing {0}'.format(self.HOME))
                shutil.rmtree(self.HOME)
            lgr.info('Uninstall Complete!')
        else:
            lgr.info('Uninstall Aborted.')

    @staticmethod
    def _find_virtualenv():
        try:
            import virtualenv  # NOQA
            return True
        except:
            return False

    @staticmethod
    def _find_pip():
        try:
            import pip  # NOQA
            return True
        except:
            return False


def parse_args(args=None):

    parser = argparse.ArgumentParser(
        description=DESCRIPTION, formatter_class=argparse.RawTextHelpFormatter)
    default_group = parser.add_mutually_exclusive_group()
    default_group.add_argument('-v', '--verbose', action='store_true',
                               help='Verbose level logging to shell.')
    default_group.add_argument('-q', '--quiet', action='store_true',
                               help='Only print errors.')

    parser.add_argument(
        '--composer-source', type=str, default=COMPOSER_SOURCE,
        help='A URL or local path to Cloudify\'s Composer package.')
    parser.add_argument(
        '--uninstall', action='store_true',
        help='Uninstalls the composer.')
    parser.add_argument(
        '--nodejs-source', type=str,
        default=LINUX_NODEJS_SOURCE if IS_LINUX else OSX_NODEJS_SOURCE,
        help='A URL or local path to a nodejs archive for your distro. '
        'This defaults to the official URL.')
    parser.add_argument(
        '--dsl-cli-source', type=str, default=DSL_PARSER_CLI_SOURCE,
        help='A URL or local path to the cloudify-dsl-parser-cli archive.')

    return parser.parse_args(args)


lgr = init_logger(__file__)


if __name__ == '__main__':
    args = parse_args()
    if args.quiet:
        lgr.setLevel(logging.ERROR)
    elif args.verbose:
        lgr.setLevel(logging.DEBUG)
    else:
        lgr.setLevel(logging.INFO)

    xargs = ['quiet', 'verbose']
    args = {arg: v for arg, v in vars(args).items() if arg not in xargs}
    if not _is_root():
        lgr.error('Composer installation requires sudo privileges. '
                  'Please rerun the script with elevated privileges.')
        sys.exit()
    installer = ComposerInstaller(**args)
    installer.execute()
