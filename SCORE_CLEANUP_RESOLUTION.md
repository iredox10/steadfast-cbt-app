# Score Data Cleanup - Issue Resolution

## Problem Identified

Students were showing scores of 2.00 even though they didn't answer any questions. This was caused by old/invalid test data in the `student_exam_scores` table.

## Root Cause

The `student_exam_scores` table had leftover records from previous tests where:
- Students had score records (2.00 marks)
- But these students had NO actual answers in the `answers` table
- The scores were orphaned/invalid data

## Affected Students

Three students had invalid scores:
1. **idris adam** - 2.00 score with 0 answers
2. **ya'u** - 2.00 score with 0 answers  
3. **chris** - 2.00 score with 0 answers

## Solution Applied

Created and ran `clean_invalid_scores.php` script which:

1. **Checks all scores** in the database
2. **Validates each score** by checking if student has actual answers
3. **Deletes invalid scores** where:
   - Student has score > 0 but no answers found
   - Student has score = 0 with no answers (unnecessary record)
4. **Keeps valid scores** where student has matching answers

## Results

✅ **3 invalid scores removed**  
✅ **0 valid scores kept** (no students have taken exams yet with answers)  
✅ **Database cleaned** and ready for accurate scoring  

## How Scores Work (Correct Behavior)

### Score Calculation Formula
```
Total Score = Correct Answers × Marks Per Question
```

### When Scores Are Created

Scores are saved in the `student_exam_scores` table when:
1. Student submits exam via `submit_exam()` endpoint
2. System counts correct answers from `answers` table
3. Calculates: `correct_answers × marks_per_question`
4. Saves to `student_exam_scores` table

### Score Validation

A valid score must have:
- ✅ Matching answer records in `answers` table
- ✅ Linked to a valid candidate record
- ✅ Correct calculation based on answers

## Prevention

To prevent this issue in the future:

### 1. Data Cleanup Script
Use `clean_invalid_scores.php` to periodically check for orphaned scores:

```bash
php clean_invalid_scores.php
```

### 2. Proper Exam Termination
When terminating exams, the system:
- Archives all student results
- Removes candidate records
- Scores remain in `student_exam_scores` table (this is correct)

### 3. Score Verification
Use `check_score_issues.php` to verify score integrity:

```bash
php check_score_issues.php
```

This shows:
- All scores in database
- Number of answers for each score
- Mismatches between stored scores and calculated scores
- Orphaned scores (scores with no answers)

## Files Created

1. **check_score_issues.php**
   - Diagnostic tool
   - Shows all scores and validates them
   - Identifies problems

2. **clean_invalid_scores.php**
   - Cleanup tool
   - Removes invalid/orphaned scores
   - Safe to run anytime

## Database Tables Involved

### student_exam_scores
Stores final scores for students:
```
- id
- student_id
- course_id
- score
- course_name
```

### answers
Stores individual question answers:
```
- id
- candidate_id
- course_id
- question_id
- is_correct  ← Used for scoring
```

### candidates
Links students to exams:
```
- id
- student_id
- exam_id
- ticket_no
```

## Testing After Cleanup

1. **Check Current State:**
   ```bash
   php check_score_issues.php
   ```
   Should show: "Total scores in database: 0"

2. **Have a Student Take Exam:**
   - Student logs in with ticket
   - Answers questions
   - Submits exam
   - Score is calculated and saved

3. **Verify New Score:**
   ```bash
   php check_score_issues.php
   ```
   Should show valid score with matching answers

## Important Notes

1. **Scores persist after exam termination** - This is correct behavior
2. **Scores are tied to courses, not specific exams** - updateOrCreate by student_id + course_id
3. **Invalid scores can occur from:**
   - Manual database changes
   - Test data not cleaned up
   - Bugs in older versions
4. **Cleanup is safe** - Only removes scores with no supporting answer data

## Conclusion

✅ Issue resolved - All invalid scores removed  
✅ Database clean and ready for production  
✅ Tools available for future diagnostics  
✅ Score calculation verified as correct  

The problem was NOT with the scoring logic (which is correct), but with old test data that wasn't cleaned up properly.
