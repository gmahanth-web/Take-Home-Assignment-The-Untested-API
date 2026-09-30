## Submission Notes

### Completed

* Added unit tests for `taskService.js`
* Added integration/API tests using Supertest
* Covered happy paths and edge cases
* Identified and documented bugs
* Fixed at least one identified bug
* Implemented `PATCH /tasks/:id/assign`
* Added tests for task assignment
* Added validation for the assignment feature
* Added handling for nonexistent tasks
* Added `.gitignore` to exclude `node_modules` and generated coverage files

### Test Results

All tests are passing.

```text
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

### Coverage

The test suite achieves more than 80% overall coverage.

### What I Would Test Next

If I had more time, I would add additional validation and boundary-case tests, including invalid pagination values, invalid task fields, duplicate assignments, and additional date-related cases.

### What Surprised Me

The API uses an in-memory data store, so all task data is lost whenever the application restarts. I also found behavior in the existing implementation that did not match the expected API behavior, which was identified through testing.

### Questions Before Production

Before shipping to production, I would clarify:

* Expected validation rules for all task fields
* Database/persistence requirements
* Authentication and authorization requirements
* Expected behavior when reassigning an already-assigned task
* Requirements for handling concurrent updates
