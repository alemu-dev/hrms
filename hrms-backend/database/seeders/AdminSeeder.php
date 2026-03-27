<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            'name'       => 'System Administrator',
            'email'      => 'admin@example.com',
            'password'   => Hash::make('12345'),
            'role'       => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('employee_profiles')->insert([
            'user_id'    => 1, // links to the admin user
            'full_name'  => 'System Administrator',
            'department' => 'ICT',
            'position'   => 'Administrator',
            'salary'     => 5000,
            'hire_date'  => now(),
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
