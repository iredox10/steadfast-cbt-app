<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Question;

class TestQuestions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:questions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test questions data structure';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $question = Question::first();

        if ($question) {
            $this->info("Question ID: " . $question->id);
            $this->info("Question Text: " . $question->question);
            $this->info("Option A: " . $question->option_a);
            $this->info("Option B: " . $question->option_b);
            $this->info("Option C: " . $question->option_c);
            $this->info("Option D: " . $question->option_d);
            $this->info("Correct Answer: " . $question->correct_answer);
        } else {
            $this->info("No questions found in the database.");
        }
    }
}