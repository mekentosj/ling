Feature: Linting a directory
  As an author of features
  I want to lint an entire directory
  So I can get an overview of the state of project

  Scenario: Parsing Ling's features
    Given the features included in this project
    When I run `bin/ling features/`
    Then I should see colourised feature files
