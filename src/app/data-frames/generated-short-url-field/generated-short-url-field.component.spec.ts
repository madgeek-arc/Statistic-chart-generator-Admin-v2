import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneratedShortUrlFieldComponent } from './generated-short-url-field.component';

describe('GeneratedShortUrlFieldComponent', () => {
  let component: GeneratedShortUrlFieldComponent;
  let fixture: ComponentFixture<GeneratedShortUrlFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [GeneratedShortUrlFieldComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratedShortUrlFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // The dashboard shows its fields without a name.
  it('has no title without a name', () => {
    expect(fixture.nativeElement.querySelector('h6')).toBeNull();
  });
});
