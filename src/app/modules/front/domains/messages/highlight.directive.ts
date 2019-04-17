import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector:'[highlight]',
    host: {
      '(click)': 'select()',
    }
  })

  export class HighlightDirective {

    private el: ElementRef;
  
    constructor(el: ElementRef){
      this.el = el;
    }
  
    @Input()
    elements;
  
    select(){
      this.elements.forEach(elt => {
        elt.unselect();
      });
  
      this.el.nativeElement.style.backgroundColor = '';
      this.el.nativeElement.style.backgroundColor = '#707F9B';
    }
  
    unselect() {
      this.el.nativeElement.style.backgroundColor = '';
    }
  }
