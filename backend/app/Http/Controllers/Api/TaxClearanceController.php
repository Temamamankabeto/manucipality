<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxClearance;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaxClearanceController extends Controller
{
    public function index(Request $request)
    {
        $clearances = TaxClearance::with([
            'citizen',
            'property',
            'assessment',
            'issuer',
        ])->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Tax clearances retrieved successfully',
            'data' => $clearances->items(),
            'meta' => [
                'current_page' => $clearances->currentPage(),
                'last_page' => $clearances->lastPage(),
                'per_page' => $clearances->perPage(),
                'total' => $clearances->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'citizen_id' => ['required', 'exists:citizens,id'],
            'property_id' => ['required', 'exists:properties,id'],
            'tax_assessment_id' => ['required', 'exists:tax_assessments,id'],
            'expiry_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        $validated['clearance_number'] = 'CLR-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
        $validated['verification_code'] = Str::upper(Str::random(10));
        $validated['status'] = 'issued';
        $validated['issued_by'] = auth()->id();
        $validated['issued_at'] = now();

        $clearance = TaxClearance::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tax clearance issued successfully',
            'data' => $clearance,
        ], 201);
    }

    public function verify(string $verificationCode)
    {
        $clearance = TaxClearance::where('verification_code', $verificationCode)
            ->with(['citizen', 'property'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Clearance verified successfully',
            'data' => $clearance,
        ]);
    }
}
