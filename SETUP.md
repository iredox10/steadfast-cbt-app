# Steadfast CBT Application Setup Guide

This document outlines the necessary data and steps required to set up and run the Steadfast CBT application.

## 1. Core Data Requirements

For the application to be fully functional, the database must be populated with the following core data. The recommended way to add this data is by using [Laravel Seeders](https://laravel.com/docs/11.x/seeding) to ensure a repeatable and consistent setup process.

### 1.1. Academic Structure

This is the foundational data that organizes the entire system.

-   **Academic Sessions (`acd_sessions` table):** The academic year (e.g., "2024/2025").
-   **Semesters (`semesters` table):** The term within the session (e.g., "First Semester", "Second Semester").
-   **Courses (`courses` table):** The subjects that students will take exams for (e.g., "Introduction to Programming", "Database Management").

### 1.2. Users

You need the different types of users who will interact with the system.

-   **Students (`students` table):** The individuals who will take the exams. You'll need their name, matriculation number, password, etc.
-   **Lecturers/Instructors (`users` table):** The individuals who will create and manage the exams and questions.
-   **Admin (`users` table):** At least one administrative user to manage the overall system.

### 1.3. Enrollment and Assignments

This data connects users to the academic structure.

-   **Lecturer to Course (`lecturer_courses` table):** Assign lecturers to the courses they are responsible for.
-   **Student to Course (`student_courses` table):** Enroll students in the courses they are registered for. This is critical for determining which exams a student is eligible to take.

### 1.4. Exam Content

This is the actual test material.

-   **Exams (`exams` table):** Define the exams themselves. Each exam needs to be linked to a course and should have properties like a title, duration, and marks per question.
-   **Questions (`question_banks` table):** For each exam, you need to create the questions. Each question entry requires:
    -   The question text itself.
    -   The correct answer (`correct_answer`).
    -   At least one other option/distractor (`option_b`, `option_c`, etc.).

---

## 2. Setup and Seeding Workflow

The following workflow describes how to use Laravel Seeders to populate your database.

### Step 1: Create Seeders

For each of the data types listed above, you can generate a seeder file using the `artisan` command.

```shell
php artisan make:seeder CourseSeeder
php artisan make:seeder StudentSeeder
php artisan make:seeder ExamSeeder
# ... and so on for other data types
```

### Step 2: Define Data in Seeders

In each newly created seeder file (e.g., `database/seeders/CourseSeeder.php`), add the logic to create the data using Laravel's query builder or Eloquent models.

### Step 3: Call Seeders from DatabaseSeeder

In the main `database/seeders/DatabaseSeeder.php` file, call your new seeders in the correct order to ensure dependencies are met (e.g., create courses before you create exams).

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CourseSeeder::class,
            StudentSeeder::class,
            // ... other seeders
        ]);
    }
}
```

### Step 4: Run the Seeders

To execute the seeders and populate the database, you can use one of the following commands:

-   **To run only the seeders:**
    ```shell
    php artisan db:seed
    ```

-   **To perform a complete database refresh and then seed:**
    ```shell
    php artisan migrate:fresh --seed
    ```

By following this process, you can quickly and reliably set up your application with all the necessary data for development and testing.
