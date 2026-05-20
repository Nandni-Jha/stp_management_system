<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('target_date');
            $table->date('actual_date')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'delayed'])->default('pending');
            $table->decimal('budget_amount', 10, 2)->default(0);
            $table->decimal('spent_amount', 10, 2)->default(0);
            $table->timestamps();

            // Indexes for performance
            $table->index('project_id');
            $table->index('status');
            $table->index('target_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('milestones');
    }
};
