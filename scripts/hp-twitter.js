new TWTR.Widget({
    version: 2,
    type: 'search',
    search: '@cloudifysource',
    interval: 30000,
    title: '',
    subject: '',
    width: 220,
    height: 60,
    theme: {
        shell: {
            background: 'none',
            color: '#ffffff'
        },
        tweets: {
            background: 'none',
            color: '#393939',
            links: '#24ACC5',
        }
    },
    features: {
        scrollbar: false,
        loop: true,
        live: true,
		avatars: false,
        behavior: 'default'
    }
}).render().start();

