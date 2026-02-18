import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyAddon } from './spotify-addon';

describe('SpotifyAddon', () => {
  let component: SpotifyAddon;
  let fixture: ComponentFixture<SpotifyAddon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyAddon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyAddon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
