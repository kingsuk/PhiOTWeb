import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewSubscriptionsComponent } from './create-new-subscriptions.component';

describe('CreateNewSubscriptionsComponent', () => {
  let component: CreateNewSubscriptionsComponent;
  let fixture: ComponentFixture<CreateNewSubscriptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewSubscriptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
