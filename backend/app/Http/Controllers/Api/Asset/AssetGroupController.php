<?php

namespace App\Http\Controllers\Api\Asset;
 use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AssetGroup;
class AssetGroupController extends Controller
{
    /**
     * GET /api/asset-groups
     * List all asset groups with asset type
     */
    public function index()
    {
        $groups = AssetGroup::with('assetType')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Asset groups fetched successfully',
            'data' => $groups
        ]);
    }

    /**
     * POST /api/asset-groups
     * Create new asset group
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_type_id' => 'required|exists:asset_types,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = AssetGroup::create([
            'asset_type_id' => $request->asset_type_id,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asset group created successfully',
            'data' => $group
        ], 201);
    }

    /**
     * GET /api/asset-groups/{id}
     * Show single asset group
     */
    public function show($id)
    {
        $group = AssetGroup::with('assetType')->find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Asset group not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $group
        ]);
    }

    /**
     * PUT/PATCH /api/asset-groups/{id}
     * Update asset group
     */
    public function update(Request $request, $id)
    {
        $group = AssetGroup::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Asset group not found'
            ], 404);
        }

        $request->validate([
            'asset_type_id' => 'sometimes|exists:asset_types,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update($request->only([
            'asset_type_id',
            'name',
            'description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Asset group updated successfully',
            'data' => $group
        ]);
    }

    /**
     * DELETE /api/asset-groups/{id}
     */
    public function destroy($id)
    {
        $group = AssetGroup::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Asset group not found'
            ], 404);
        }

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset group deleted successfully'
        ]);
    }
}
