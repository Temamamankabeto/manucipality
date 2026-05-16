<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaxPaymentController extends Controller
{
    public function index(Request $request)
    {
        $payments = TaxPayment::with([
            'bill',
            'citizen',
            'collector',
            'verifier',
        ])->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Tax payments retrieved successfully',
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tax_bill_id' => ['required', 'exists:tax_bills,id'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string'],
            'reference_number' => ['nullable', 'string'],
        ]);

        $validated['payment_number'] = 'PAY-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
        $validated['status'] = 'pending';
        $validated['collected_by'] = auth()->id();
        $validated['paid_at'] = now();

        $payment = TaxPayment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment collected successfully',
            'data' => $payment,
        ], 201);
    }

    public function verify(TaxPayment $taxPayment)
    {
        $taxPayment->update([
            'status' => 'verified',
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data' => $taxPayment,
        ]);
    }
}
