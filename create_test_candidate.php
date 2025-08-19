<?php

require_once 'vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Database\Capsule\Manager as Capsule;

// Create a service container
$container = new Container();

// Create a database capsule
$capsule = new Capsule($container);
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => env('DB_HOST', '127.0.0.1'),
    'database'  => env('DB_DATABASE', 'steadfast'),
    'username'  => env('DB_USERNAME', 'root'),
    'password'  => env('DB_PASSWORD', ''),
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Create a test candidate
$candidate = new App\Models\Candidate();
$candidate->student_id = 1;
$candidate->exam_id = 1;
$candidate->full_name = 'Test Student';
$candidate->programme = 'Computer Science';
$candidate->department = 'Science';
$candidate->candidate_no = 'CS123456';
$candidate->score = 85;
$candidate->save();

echo "Created test candidate with ID: " . $candidate->id . "\n";
