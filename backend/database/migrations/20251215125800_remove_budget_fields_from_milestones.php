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
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn(['budget_amount', 'spent_amount']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->decimal('budget_amount', 10, 2)->default(0)->after('status');
            $table->decimal('spent_amount', 10, 2)->default(0)->after('budget_amount');
        });
    }
};
