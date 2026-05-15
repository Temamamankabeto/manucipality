<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('asset_auctions', function (Blueprint $table) {

            $table->id();

            /*
            Disposal Reference
            */

            $table->foreignId('asset_disposal_id')
                ->constrained('asset_disposals')
                ->cascadeOnDelete();

            /*
            Buyer Information
            */

            $table->string('buyer_name');

            $table->string('buyer_phone')
                ->nullable();

            $table->string('buyer_address')
                ->nullable();

            /*
            Auction Information
            */

            $table->decimal('sale_amount', 15, 2);

            $table->date('auction_date');

            /*
            Payment Information
            */

            $table->enum('payment_status', [
                'pending',
                'paid'
            ])->default('pending');

            /*
            Remark
            */

            $table->text('remark')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_auctions');
    }
};
