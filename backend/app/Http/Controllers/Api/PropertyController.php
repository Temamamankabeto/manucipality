<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::query()->with(['category', 'citizens']);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('property_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('property_category_id')) {
            $query->where('property_category_id', $request->integer('property_category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $properties = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Properties retrieved successfully',
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_category_id' => ['required', 'exists:property_categories,id'],
            'property_number' => ['nullable', 'string', 'max:100', 'unique:properties,property_number'],
            'title' => ['required', 'string', 'max:255'],
            'property_type' => ['required', 'string', 'max:100'],
            'area_size' => ['nullable', 'numeric', 'min:0'],
            'area_unit' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'string', 'max:100'],
            'longitude' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'city_id' => ['nullable', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'exists:offices,id'],
            'status' => ['nullable', 'in:draft,active,inactive'],
        ]);

        $validated['property_number'] = $validated['property_number'] ?? 'PROP-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6));
        $validated['area_unit'] = $validated['area_unit'] ?? 'sqm';
        $validated['status'] = $validated['status'] ?? 'active';

        $property = Property::create($validated)->load(['category', 'citizens']);

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    public function show(Property $property)
    {
        return response()->json([
            'success' => true,
            'message' => 'Property retrieved successfully',
            'data' => $property->load(['category', 'citizens']),
        ]);
    }

    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'property_category_id' => ['sometimes', 'exists:property_categories,id'],
            'property_number' => ['sometimes', 'string', 'max:100', 'unique:properties,property_number,' . $property->id],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'property_type' => ['sometimes', 'required', 'string', 'max:100'],
            'area_size' => ['nullable', 'numeric', 'min:0'],
            'area_unit' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'string', 'max:100'],
            'longitude' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'city_id' => ['nullable', 'exists:offices,id'],
            'subcity_id' => ['nullable', 'exists:offices,id'],
            'woreda_id' => ['nullable', 'exists:offices,id'],
            'status' => ['nullable', 'in:draft,active,inactive'],
        ]);

        $property->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Property updated successfully',
            'data' => $property->fresh(['category', 'citizens']),
        ]);
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully',
            'data' => [],
        ]);
    }
}
