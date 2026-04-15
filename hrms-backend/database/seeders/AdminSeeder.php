<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@example.com'], // check if exists
            [
                'name'       => 'System Administrator',
                'password'   => Hash::make('12345'),
                'role'       => 'admin',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}