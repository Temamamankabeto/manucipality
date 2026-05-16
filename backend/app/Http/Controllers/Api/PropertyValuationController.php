<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyValuation;
use Illuminate\Http\Request;

class PropertyValuationController extends Controller
{
    public function index(Request $request)
    {
        $query = PropertyValuation::query()
            ->with([
                'property',
                'valuator',
                'approver',
            ]);

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->integer('property_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $valuations = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Property valuations retrieved successfully',
            'data' => $valuations->items(),
            'meta' => [
                'current_page' => $valuations->currentPage(),
                'last_page' => $valuations->lastPage(),
                'per_page' => $valuations->perPage(),
                'total' => $valuations->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'market_value' => ['required', 'numeric', 'min:0'],
            'government_value' => ['nullable', 'numeric', 'min:0'],
            'valuation_date' => ['required', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        $validated['valuator_id'] = auth()->id();
        $validated['status'] = 'submitted';

        $valuation = PropertyValuation::create($validated)
            ->load(['property', 'valuator']);

        return response()->json([
            'success' => true,
            'message' => 'Property valuation created successfully',
            'data' => $valuation,
        ], 201);
    }
}
