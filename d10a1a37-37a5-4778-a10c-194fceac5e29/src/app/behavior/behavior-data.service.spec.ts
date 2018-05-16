import { TestBed, inject } from '@angular/core/testing';

import { BehaviorDataService } from './behavior-data.service';

describe('BehaviorDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BehaviorDataService]
    });
  });

  it('should be created', inject([BehaviorDataService], (service: BehaviorDataService) => {
    expect(service).toBeTruthy();
  }));
});
