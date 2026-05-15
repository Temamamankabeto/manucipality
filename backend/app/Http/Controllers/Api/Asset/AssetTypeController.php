<?php

namespace App\Http\Controllers\Api\Asset;

use App\Http\Controllers\Controller;
use App\Models\AssetType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssetTypeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Display All Asset Types
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        try {

            $assetTypes = AssetType::with([
                'assetGroups',
                'assets'
            ])->latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'Asset types fetched successfully.',
                'data' => $assetTypes
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset types.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Store Asset Type
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [

            'name' => 'required|string|max:255|unique:asset_types,name',

            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {

            $assetType = AssetType::create([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asset type created successfully.',
                'data' => $assetType
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to create asset type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Show Single Asset Type
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        try {

            $assetType = AssetType::with([
                'assetGroups',
                'assets'
            ])->find($id);

            if (!$assetType) {

                return response()->json([
                    'success' => false,
                    'message' => 'Asset type not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Asset type fetched successfully.',
                'data' => $assetType
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch asset type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Asset Type
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $assetType = AssetType::find($id);

        if (!$assetType) {

            return response()->json([
                'success' => false,
                'message' => 'Asset type not found.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [

            'name' => 'required|string|max:255|unique:asset_types,name,' . $id,

            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {

            $assetType->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asset type updated successfully.',
                'data' => $assetType
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to update asset type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Asset Type
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        try {

            $assetType = AssetType::find($id);

            if (!$assetType) {

                return response()->json([
                    'success' => false,
                    'message' => 'Asset type not found.'
                ], 404);
            }

            $assetType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Asset type deleted successfully.'
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete asset type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}