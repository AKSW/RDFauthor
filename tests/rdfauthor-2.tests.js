test("Load RDFauthor 2", function() {
  ok( typeof RDFauthor == 'object', "Loaded successfully" );
});

RDFauthor.getInstance(function(RDFauthorInstance) {
  test("Valid RDFauthor Instance", function() {
    ok (typeof RDFauthorInstance.version == 'number', 'Valid RDFauthor instance of version: ' + RDFauthorInstance.version);
  });
});

RDFauthor.getInstance(function(RDFauthorInstance) {
  // set test value
  RDFauthorInstance.version = 0.5;
});
  
asyncTest("Singleton-Test 1", 1, function() {
  setTimeout(function() {
    RDFauthor.getInstance(function(RDFauthorInstance) {
      equal (RDFauthorInstance.version, 0.5, 'Should be version 0.5: ' + RDFauthorInstance.version);
      RDFauthorInstance.version = 0.3;
      start();
    });
  }, 100);
});
  
asyncTest("Singleton-Test 2", 1, function() {
  setTimeout(function() {
    RDFauthor.getInstance(function(RDFauthorInstance) {
      equal (RDFauthorInstance.version, 0.3, 'Should be version 0.3: ' + RDFauthorInstance.version);
      RDFauthorInstance.version = 0.9;
      start();
    });
  }, 200);
});
  
asyncTest("Singleton-Test 3", 1, function() {
  setTimeout(function() {
    RDFauthor.getInstance(function(RDFauthorInstance) {
      equal (RDFauthorInstance.version, 0.9, 'Should be version 0.9: ' + RDFauthorInstance.version);
    });
    start();
  }, 300);
});

RDFauthor.getInstance(function(RDFauthorInstance) {
  var options = RDFauthorInstance.getOptions();
    
  test('getOptions - fullscreen should be "false"', function() {
    options = RDFauthorInstance.getOptions();
    ok (options.view.fullscreen === false, 'Fullscreen value: ' + options.view.fullscreen);
  });

  asyncTest('getOptions - fullscreen should be "true"', function() {
    expect(1);
    
    setTimeout(function() {
      RDFauthorInstance.setOptions({
        view: {
          fullscreen: true
        }
      });
      options = RDFauthorInstance.getOptions();
      ok (options.view.fullscreen === true, 'Fullscreen value: ' + options.view.fullscreen);
      start();
    }, 100);  
  });
  
  asyncTest('View initialized', function() {
    setTimeout(function() {
      // set type to desktop
      RDFauthorInstance.setOptions({
        view: {
          type: 'desktop'
        }
      });
      
      var isDesktopView = RDFauthorInstance.view() instanceof DesktopView;
      
      ok (isDesktopView, 'Is instance of DesktopView: ' + RDFauthorInstance.view().type());
      
      start();
    }, 110);
  });
  
});   
