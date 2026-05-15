<?php

namespace App\Http\Controllers\Api\Asset;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
class AssetController extends Controller
{
    //
    /**
     * GET /api/assets
     * List assets with pagination + relations
     */
    public function index(Request $request)
    {
        $assets = Asset::with([
                'assetType',
                'assetGroup',
                'assetSubgroup',
                'department',
                'storeKeeper'
            ])
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Assets fetched successfully',
            'data' => $assets
        ]);
    }

    /**
     * POST /api/assets
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_type_id' => 'required|exists:asset_types,id',
            'asset_group_id' => 'required|exists:asset_groups,id',
            'asset_subgroup_id' => 'required|exists:asset_subgroups,id',

            'asset_code' => 'required|string|unique:assets,asset_code',
            'asset_name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',

            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric',
            'supplier' => 'nullable|string|max:255',

            'quantity' => 'required|integer|min:1',
            'available_quantity' => 'nullable|integer',

            'condition' => 'nullable|string',
            'status' => 'nullable|string',
            'working_status' => 'nullable|string',

            'location' => 'nullable|string',

            'department_id' => 'nullable|exists:departments,id',
            'store_keeper_id' => 'nullable|exists:users,id',

            'description' => 'nullable|string',
        ]);

        $asset = Asset::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Asset created successfully',
            'data' => $asset
        ], 201);
    }

    /**
     * GET /api/assets/{id}
     */
    public function show($id)
    {
        $asset = Asset::with([
                'assetType',
                'assetGroup',
                'assetSubgroup',
                'department',
                'storeKeeper'
            ])
            ->find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $asset
        ]);
    }

    /**
     * PUT /api/assets/{id}
     */
    public function update(Request $request, $id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        $request->validate([
            'asset_type_id' => 'sometimes|exists:asset_types,id',
            'asset_group_id' => 'sometimes|exists:asset_groups,id',
            'asset_subgroup_id' => 'sometimes|exists:asset_subgroups,id',

            'asset_code' => 'sometimes|unique:assets,asset_code,' . $id,
            'asset_name' => 'sometimes|string|max:255',

            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',

            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric',
            'supplier' => 'nullable|string|max:255',

            'quantity' => 'nullable|integer|min:1',
            'available_quantity' => 'nullable|integer',

            'condition' => 'nullable|string',
            'status' => 'nullable|string',
            'working_status' => 'nullable|string',

            'location' => 'nullable|string',

            'department_id' => 'nullable|exists:departments,id',
            'store_keeper_id' => 'nullable|exists:users,id',

            'description' => 'nullable|string',
        ]);

        $asset->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Asset updated successfully',
            'data' => $asset
        ]);
    }

    /**
     * DELETE /api/assets/{id}
     */
    public function destroy($id)
    {
        $asset = Asset::find($id);

        if (!$asset) {
            return response()->json([
                'success' => false,
                'message' => 'Asset not found'
            ], 404);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully'
        ]);
    }
}
