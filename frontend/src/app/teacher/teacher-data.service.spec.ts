import { TestBed } from '@angular/core/testing';

import { TeacherDataService } from './teacher-data.service';

describe('TeacherDataService', () => {
  let service: TeacherDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
