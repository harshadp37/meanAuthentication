import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as $ from 'jquery';
import { Router, Scroll } from '@angular/router';
import { MEANdataService } from 'src/app/service/meandata.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {

  @Input()
  routeTitle: string;

  mainFolder: any[];

  finish: boolean = false;

  constructor(private router: Router, private MEANdata: MEANdataService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    if (this.routeTitle === "Registration") {
      this.MEANdata.getRegistrationFile().subscribe((res) => {
        this.mainFolder = res;
        this.finish = true;
        this.bindJQuery();
      })
    } else {
      this.MEANdata.getLoginFile().subscribe((res) => {
        this.mainFolder = res;
        this.finish = true;
        this.bindJQuery();
      })
    }
  }

  bindJQuery() {
    this.clickEvent();

    $(document).ready(function () {
      
      $(document).scroll(function (e) {
        $('.containe div').each(function () {
          if (
            $(this).offset().top < window.pageYOffset + 63
            //begins before top
            && $(this).offset().top + $(this).height() > window.pageYOffset + 63
            //but ends in visible area
            //+ 10 allows you to change hash before it hits the top border
          ) {
            let id = $(this).attr('id');
            $('.menu .file a').css('color', 'black');
            $('.menu .file').find('span:contains('+ id +')').next('a').css('color', 'green');
          }
        });
      });

      $('.menu .folder').bind('click', function (event) {
        event.stopPropagation();
        $(this).children('ul').toggle({ duration: 500 });
      });

      $('.menu .file').bind('click', function (event) {
        event.stopPropagation();

        $('.menu .file a').css('color', 'black');
        $(this).children('a').css('color', 'green');

        let hash = $(this)[0].children[0].textContent;

        const element = document.querySelector("#" + hash);
        if (element) {
          element.scrollIntoView({ block: 'start' });
          window.scrollBy({ top: -63 });
        }
      });

      $(window).resize(function () {
        if ($(window).width() <= 751) {
          $('.menu').hide();
          $('.arrow, .labl').unbind('click');
          $('.arrow').addClass('glyphicon-chevron-left');
          $('.arrow').removeClass('glyphicon-chevron-right');

          $('.arrow, .labl').bind('click', function () {
            $('.menu').toggle()

            $('.arrow').toggleClass('glyphicon-chevron-left');
            $('.arrow').toggleClass('glyphicon-chevron-right');
          })
        } else {
          $('.menu').show();
          $('.arrow, .labl').unbind('click');
        }
      })
    })
  }

  clickEvent() {
    $(document).ready(function () {
      if ($(window).width() <= 751) {
        $('.menu').hide();
        $('.arrow, .labl').unbind('click');
        $('.arrow').addClass('glyphicon-chevron-left');
        $('.arrow').removeClass('glyphicon-chevron-right');
        
        $('.arrow, .labl').bind('click', function () {
          $('.menu').toggle()

          $('.arrow').toggleClass('glyphicon-chevron-left');
          $('.arrow').toggleClass('glyphicon-chevron-right');
        })
      } else {
        $('.menu').show();
        $('.arrow, .labl').unbind('click');
      }
    })
  }
}
