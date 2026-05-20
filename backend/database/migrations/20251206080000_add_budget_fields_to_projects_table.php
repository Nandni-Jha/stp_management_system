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
        Schema::table('projects', function (Blueprint $table) {
            $table->decimal('budget', 10, 2)->nullable()->after('status');
            $table->decimal('spent_amount', 10, 2)->default(0)->after('budget');
            $table->string('budget_currency', 3)->default('USD')->after('spent_amount');
            $table->text('budget_notes')->nullable()->after('budget_currency');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['budget', 'spent_amount', 'budget_currency', 'budget_notes']);
        });
    }
};
