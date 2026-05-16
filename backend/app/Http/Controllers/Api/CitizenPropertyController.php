<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CitizenProperty;
use Illuminate\Http\Request;

class CitizenPropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = CitizenProperty::query()
            ->with(['citizen', 'property']);

        if ($request->filled('citizen_id')) {
            $query->where('citizen_id', $request->integer('citizen_id'));
        }

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->integer('property_id'));
        }

        $items = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Citizen properties retrieved successfully',
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'citizen_id' => ['required', 'exists:citizens,id'],
            'property_id' => ['required', 'exists:properties,id'],
            'ownership_type' => ['required', 'in:owner,co_owner,lease_holder'],
            'ownership_start_date' => ['nullable', 'date'],
            'ownership_end_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $item = CitizenProperty::create($validated)
            ->load(['citizen', 'property']);

        return response()->json([
            'success' => true,
            'message' => 'Citizen property linked successfully',
            'data' => $item,
        ], 201);
    }

    public function destroy(CitizenProperty $citizenProperty)
    {
        $citizenProperty->delete();

        return response()->json([
            'success' => true,
            'message' => 'Citizen property removed successfully',
            'data' => [],
        ]);
    }
}
