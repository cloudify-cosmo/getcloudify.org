---
layout: bt_default
title: Cloudify Examples Home
---

<script data-require="angular.js@1.4.3" data-semver="1.4.3" src="https://code.angularjs.org/1.4.3/angular.js"></script>
<script data-require="lodash.js@3.10.0" data-semver="3.10.0" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.js"></script>

<div ng-app="cosmo-dipper">
  <section id="inner-headline">
    <div class="container">
      <div class="row">
        <div class="span12">
          <div class="inner-heading">
            <h1><strong>Cloudify Examples</strong></h1>
              <div ng-controller="cosmo-dipper-ctrl">
              <script src="script.js"></script>
                <ul>
                  <li ng-repeat="item in repositories.items">[[item.name]]</li>
                </ul>
<!--                 <pre>
                  [[repositories | json ]]
                </pre>
 -->            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>