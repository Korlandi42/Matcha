import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNavLoggedComponent } from './top-nav-logged.component';

describe('TopNavLoggedComponent', () => {
  let component: TopNavLoggedComponent;
  let fixture: ComponentFixture<TopNavLoggedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopNavLoggedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavLoggedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
