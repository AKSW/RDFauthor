/**
 * This file is part of the RDFauthor project.
 * Author: Clemens Hoffmann <cannelony@gmail.com>
 * 
 * Creates a view object.
 * 
 * @constructor
 * @requires RDFauthor 2
 */
function DesktopView (options) {
  
  // default options
    var defaultOptions = {
      title: 'Edit Properties',
      saveButtonTitle: 'Save',
      cancelButtonTitle: 'Cancel',
      propertyButtonTitle: 'Add Property',
      container: 'body',
      showButtons: true,
      showPropertyButton: true,
      useAnimations: true,
      animationTime: 250, // ms
      domId: 'rdfauthor-view',
      contentContainerClass: 'rdfauthor-view-content'/*,
      replaceContainerContent: false*/
    };
  
  this._options = jQuery.extend(defaultOptions, options);
  
  this._self = this;
  this._container = jQuery('#' + this._options.domId);
  this._modalSize = {};
  console.log(this._container);
  console.log(options);
  
  function getHeader () {
    var header = '\
      <div class="modal-header">\
        <button type="button" class="icon-remove icon-modal-header" data-dismiss="modal" data-toggle="tooltip" data-placement="left" title="Close window"></button>\
        <button type="button" class="icon-fullscreen icon-modal-header fullscreen" data-toggle="tooltip" data-placement="left" title="Fullscreen/Minimize"></button>\
        <h4 class="modal-title">RDFauthor</h4>\
      </div>';
    return header;    
  }
  
  function getBody () {
    var body = '\
      <div class="modal-body">\
        <ul id="resource-tabs" class="nav nav-tabs">\
        </ul>\
        <div id="resource-tabs-content" class="tab-content">\
        </div>\
      </div>';
    return body;
  }
  
  function getFooter () {
    var footer = '\
      <div class="modal-footer">\
        <!-- consumer mode -->\
        <a href="#" class="btn btn-default consumer-mode" data-dismiss="modal">Close choreography</a>\
        <a href="#" class="btn btn-primary edit">Edit choreography</a>\
        <a href="#" class="btn btn-primary">Save</a>\
        <!-- edit mode-->\
        <a href="#" class="btn btn-default hide edit-mode cancel">Cancel</a>\
        <!-- <a href="#" class="btn hide edit-mode" data-dismiss="modal">Close all</a> -->\
        <a href="#" class="btn btn-primary hide save edit-mode">Save all resources</a>\
        <a href="#" class="btn btn-primary hide save edit-mode">Save resource</a>\
        <a href="#" class="btn btn-primary hide save edit-mode">Save choreography</a>\
      </div>';
    return footer;
  }
  
  function getView (options, callback) {
    var html = '\
    <div id="rdfauthor">\
      <div id="' + options.domId + '" class="modal fade consumer-mode">\
        <div class="modal-dialog">\
          <div class="modal-content">\
            ' + getHeader() + '\
            ' + getBody() + '\
            ' + getFooter() + '\
          </div>\
        </div>\
        </div>\
      </div>';
    if ($.isFunction(callback)) {
      callback(html, options);
    }
  }
  
  //view initialization
  getView(this._options, function(html, options) {
    $('body').append(html);
    // hack for correct resizing and dragging
    $('.modal-dialog').css("margin-right", 0);
    $('.modal-dialog').css("margin-left", 0);
    /** activate plugins */
    var minWidth = $('.modal-dialog').outerWidth()-20;
    var minHeight = $('.modal-dialog').outerHeight();
    console.log(minWidth, minHeight);
    $('#' + options.domId + ' .modal-content').resizable({ 
      // alsoResize: ".modal-dialog",
      minWidth: minWidth,
      minHeight: 200
    });
    
    $('.modal').on("drag resize", function(event, ui) {
      // hack for correct resizing and dragging
      $('.modal-dialog').css("margin-right", 0);
      $('.modal-dialog').css("margin-left", 0);
    });
    
    $(".modal").on("resize", function(event, ui) {
      console.log('ui',ui);
      // ui.element.css("margin-left", -ui.size.width/2);
      // ui.element.css("margin-top", -ui.size.height/2);
      // ui.element.css("left", "50%");
      // ui.element.css("top", "50%");
      // fit size of modal body to prevent layout glitches
      $(ui.element).find('.modal-body').each(function() {
        var maxHeight = ui.size.height-$('.modal-header').outerHeight()-$('.modal-footer').outerHeight();
        $(this).css("max-height", maxHeight - 20);
        $(this).find('.tab-pane').css('height', maxHeight-$('.modal-footer').outerHeight());
        // store size of modal
//        self.storeSize();
      });
      
    });
    
       
    $('#' + options.domId + ' .modal-content').draggable({
      handle: '.modal-header',
      cursor: 'move'
    });
    
    $('.portlet-container').sortable({
      disabled : true
    }).disableSelection();
    $('.modal-header button').tooltip();
    
    /** bootstrap event */
    $('#' + options.domId).on('hidden.bs.modal', function () {
      console.log('hidden');
      //$('body').css('overflow', 'auto');
    });
    
    $('#' + options.domId).on('show.bs.modal', function () {
      console.log('shown');
    });
    
    /** jquery events */ 
    // Recource tabs + dropdown 
    $(document).on('click', '#resource-tabs a', function(event) {
      
      console.log('click on dropdown item');
      var subjectContentID = $(this).parents('.dropdown').find('a.tabs').attr('href');
      var subjectContent = $('#rdfauthor-view ' + subjectContentID);
      console.log('id', subjectContentID);
      console.log('content', subjectContent);
  
      if (!$(this).hasClass('disabled')) {
        // add portlet
        if($(this).hasClass('add-portlet')) {
          addPortlet(subjectContent);
        }
      }
    });
    
    $(document).on('click', '.tabs', function(event) {
      event.preventDefault();
      $(this).tab('show');
      // $(this).parent().dropdown('toggle');
    });
  
    var openTabDropdown = false;
    var tabDropdown = $('.tabs .dropdown');
    $(document).on('click', '.tabs i', function(event) {
      event.preventDefault();
      tabDropdown = $(this).parents('.dropdown');
      tabDropdown.toggleClass('open');
    });

    // manually open close dropdown on tabs' dropdown
    $('html').unbind('click').click(function(event){
      if ($('.nav-tabs li').hasClass('open') && openTabDropdown == false) {
        $('.nav-tabs li').removeClass('open');
      }
    });
    $('.nav-tabs .dropdown-menu').mouseover(function() {
      openTabDropdown = true;
    });
    $('.nav-tabs .dropdown-menu').mouseout(function() {
      openTabDropdown = false;
    });
    
    $(document).on('click', '.modal-footer a', function(event) {
      if ($(this).hasClass('edit') || $(this).hasClass('save') || $(this).hasClass('cancel')) {
        $(this).parent().find('.btn').toggleClass('hide');
      }
      
      // enable edit mode
      if ($(this).hasClass('edit')) {
        // enable disabled actions
        $('#' + options.domId).find('.disabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .lportlet-content').sortable('option', 'disabled', false);
        // $('#rdfauthor-view input, #rdfauthor-view textarea').prop('disabled', false);
        // enableSettings();
      }
  
      // disable edit mode and save
      if ($(this).hasClass('save')) {
        // enable disabled actions
        $('#' + options.domId).find('.enabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .portlet-content').sortable( 'option', 'disabled', true );
        // $('#rdfauthor-view input, #rdfauthor-view textarea').prop('disabled', true);
        // disableSettings();
//        saveChoreography();
      }
      // disable edit mode and don't save anything
      if ($(this).hasClass('cancel')) {
        // enable disabled actions
        $('#' + options.domId).find('.enabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .portlet-content').sortable( 'option', 'disabled', true );
        // disableSettings();
//        restoreChoreography();
      }
    });
    
  });
}

DesktopView.prototype = {
  
  
  addChoreography: function () {
    
  },
  
  addPortlet: function () {
    
  },
  
  addResources: function () {
    
  },
  
  addTabs: function (storedSubjects) {
    var self = this;
    console.log('test',storedSubjects);
    var count = 0;
    var liTab = '';
    var divTab = '';
    for (var subject in storedSubjects) {
      count++;
      var label = storedSubjects[subject];
      var uri = subject;
      
      liTab += '\
        <li class="dropdown" name="' + subject + '">\
          <a class="tabs dropdown-toggle" href="#tab-' + count + '" data-toggle="dropdown">\
            ' + label + ' <i class="icon-cog settings"></i>\
          </a>\
          <ul class="dropdown-menu">\
            <li><a class="rename-portlet" href="#" data-toggle="tab"><i class="icon-pencil"></i> Rename</a></li>\
            <li><a class="disabled add-portlet" href="#" data-toggle="tab"><i class="icon-plus-sign"></i> Add Portlet</a></li>\
          </ul>\
        </li>';
      divTab += '<div name="' + subject + '" class="tab-pane" id="tab-' + count + '"></div>';
    }
    self.getElement().find('#resource-tabs').append(liTab);
    self.getElement().find('#resource-tabs-content').append(divTab);
    self.getElement().find('#resource-tabs a:first').tab('show');
    self.enableSettings();
    // $('.dropdown-toggle').dropdown();
    
    
    
  },
  
  center: function () {
    
  },
  
  close: function () {
    
  },
  
  getNumberOfPortlets: function () {
    
  },
  
  getElement: function () {
    return jQuery('#' + this._options.domId);
  },
  
  enableSettings: function () {
    // $('.portlet .settings, .tabs .settings, .portlet-entry .btn-group')
      // .toggleClass('hide-important');
    // $('.portlet input').toggleClass('input-fullsize input-size-135');
  
    $('.portlet').hover(function() {
      $(this).find('.settings').fadeTo(1,1);
    },function() {
      if($(this).parents('li').hasClass('open')) {
        $(this).find('.settings').fadeTo(1,1);
      } else {
        $(this).find('.settings').fadeTo(1,0);
      }  
    });
  
    $('.tabs').hover(function() {
      $(this).find('.settings').fadeTo(1,1);
    },function() {
      $(this).find('.settings').fadeTo(1,0);
    });
  
    $('.portlet-entry').hover(function() {
      $(this).find('.property-settings').fadeTo(1,1);
    },function() {
      if($(this).parents('li').hasClass('open')) {
        $(this).find('.property-settings').fadeTo(1,1);
      } else {
        $(this).find('.property-settings').fadeTo(1,0);
      }  
    });
  
  },
    
  minimize: function () {
    
  },
  
  reset: function () {
    
  },
  
  saveAll: function () {
    
  },
  
  saveResource: function (subjectUri) {
    
  },
  
  show: function () {
    var self = this;
    console.log('show');
    
    self.getElement().modal({
      show: true
    });
    
    $(document).on('click', '.modal-header button', function(event) {
    if ($(this).hasClass('fullscreen')) {
      $(this).toggleClass('icon-fullscreen icon-resize-small');
      self.toggleFullscreen();
    }
    
    
    
    
    
  });
    
  },
  
  storeSize: function () {
    var self = this;
    var modal = self.getElement().find('.modal-dialog');
    // store values
    var modalSize = {
      'modal' : {
        'marginLeft' : -modal.outerWidth()/2,
          'marginTop' : -modal.outerHeight()/2,
          'height' : modal.outerHeight(),
          'width' : modal.outerWidth(),
          'top' : '50%',
          'left' : '50%'
      },
      'modalBody' : {
        'maxHeight' : modal.outerHeight()-$('.modal-header').outerHeight()-$('.modal-footer').outerHeight()
      }
    }
    
    console.log('modalSize', modalSize);
    
    // append values to rdfauthor view
    self._modalSize = modalSize;
  },
  
  toggleFullscreen: function () {
    var self = this;
    var modal = self.getElement().find('.modal-dialog');
    modal.toggleClass('fullscreen');
    
    
    if (modal.hasClass('fullscreen')) {
      self.storeSize();
      // modal.find('.modal-content').draggable('option', 'disabled', true);
      // modal.find('.modal-content').resizable('option', 'disabled', true);
      modal.css('width', '100%');
      modal.css('height', '100%');
      // modal.css("margin-left", -modal.outerWidth()/2);
      // modal.css("margin-top", -modal.outerHeight());
      // modal.css("top", "50%");
      // modal.css("left", "50%");
      modal.find(".modal-body").each(function() {
        var maxHeight = modal.height()-$('.modal-header').outerHeight()-$('.modal-footer').outerHeight()-20;
        $(this).css("max-height", maxHeight);
        $(this).find('.tab-pane').css('height', maxHeight);
        $(this).find('.tab-pane').css('height', maxHeight-$('.modal-footer').outerHeight());
      });
    } else {
      //TODO größe wiederherstellen
      var modalSize = self._modalSize;
      console.log('modalSize', modalSize);
      // modal.find('.modal-content').draggable('option', 'disabled', false);
      // modal.find('.modal-content').resizable('option', 'disabled', false);
      modal.find('.modal-content').css('width', modalSize.modal.width);
      modal.find('.modal-content').css('height',modalSize.modal.height);
      // modal.css("margin-left", modalSize.modal.marginLeft);
      // modal.css("margin-top", modalSize.modal.marginTop);
      // modal.css("top", "50%");
      // modal.css("left", "50%");
      modal.find(".modal-body").css('max-height', modalSize.modalBody.maxHeight);

    }
    
    // $(".modal-dialog").animate({ width: '100%', height: '700px'},300,'linear');
    
  },
  
  type: function () {
    return 'desktop';
  }
  
}
