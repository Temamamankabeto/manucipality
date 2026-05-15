<?php

namespace App\Http\Controllers\Api\Asset;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AssetSubgroup;
class AssetSubgroupController extends Controller
{
    //
    public function index(Request $request)
    {
        $subgroups = AssetSubgroup::with('assetGroup')
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Asset subgroups fetched successfully',
            'data' => $subgroups
        ]);
    }

    /**
     * POST /api/asset-subgroups
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_group_id' => 'required|exists:asset_groups,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subgroup = AssetSubgroup::create([
            'asset_group_id' => $request->asset_group_id,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asset subgroup created successfully',
            'data' => $subgroup
        ], 201);
    }

    /**
     * GET /api/asset-subgroups/{id}
     */
    public function show($id)
    {
        $subgroup = AssetSubgroup::with('assetGroup', 'assets')
            ->find($id);

        if (!$subgroup) {
            return response()->json([
                'success' => false,
                'message' => 'Asset subgroup not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subgroup
        ]);
    }

    /**
     * PUT /api/asset-subgroups/{id}
     */
    public function update(Request $request, $id)
    {
        $subgroup = AssetSubgroup::find($id);

        if (!$subgroup) {
            return response()->json([
                'success' => false,
                'message' => 'Asset subgroup not found'
            ], 404);
        }

        $request->validate([
            'asset_group_id' => 'sometimes|exists:asset_groups,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subgroup->update($request->only([
            'asset_group_id',
            'name',
            'description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Asset subgroup updated successfully',
            'data' => $subgroup
        ]);
    }

    /**
     * DELETE /api/asset-subgroups/{id}
     */
    public function destroy($id)
    {
        $subgroup = AssetSubgroup::find($id);

        if (!$subgroup) {
            return response()->json([
                'success' => false,
                'message' => 'Asset subgroup not found'
            ], 404);
        }

        $subgroup->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset subgroup deleted successfully'
        ]);
    }
}
