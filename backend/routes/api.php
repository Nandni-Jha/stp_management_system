<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\AssetTypeController;
use App\Http\Controllers\Api\AssetCategoryController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\OperatorController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\AssetAssignmentController;
use App\Http\Controllers\Api\AssetUsageLogController;
use App\Http\Controllers\Api\FuelLogController;
use App\Http\Controllers\Api\MaintenanceTypeController;
use App\Http\Controllers\Api\MaintenanceRecordController;
use App\Http\Controllers\Api\AssetDocumentController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\MilestoneController;
use App\Http\Controllers\Api\MilestoneEquipmentBudgetController;
use App\Http\Controllers\Api\MilestoneMaterialBudgetController;
use App\Http\Controllers\Api\MilestoneLaborBudgetController;
use App\Http\Controllers\Api\MilestoneScBudgetController;
use App\Http\Controllers\Api\LaborController;
use App\Http\Controllers\Api\LaborCategoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/operator-login', [AuthController::class, 'operatorLogin']);

Route::middleware('auth:sanctum')->group(function () {
    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile routes
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/profile', [ProfileController::class, 'updateProfile']); // For multipart form data with _method=PUT
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Customer routes
    Route::apiResource('/customers', CustomerController::class);

    // User routes
    Route::apiResource('/users', UserController::class);

    // Fleet Management routes
    Route::apiResource('/locations', LocationController::class);
    Route::apiResource('/asset-types', AssetTypeController::class);
    Route::apiResource('/asset-categories', AssetCategoryController::class);
    Route::apiResource('/assets', AssetController::class);
    Route::apiResource('/operators', OperatorController::class);
    Route::apiResource('/projects', ProjectController::class);
    Route::apiResource('/asset-assignments', AssetAssignmentController::class);
    Route::apiResource('/asset-usage-logs', AssetUsageLogController::class);
    Route::apiResource('/fuel-logs', FuelLogController::class);
    Route::apiResource('/maintenance-types', MaintenanceTypeController::class);
    Route::apiResource('/maintenance-records', MaintenanceRecordController::class);
    Route::apiResource('/asset-documents', AssetDocumentController::class);
    Route::get('/asset-documents/{id}/download', [AssetDocumentController::class, 'download']);
    Route::apiResource('/vendors', VendorController::class);
    Route::apiResource('/alerts', AlertController::class);

    // Milestone Management routes
    Route::apiResource('/milestones', MilestoneController::class);
    Route::apiResource('/milestone-equipment-budgets', MilestoneEquipmentBudgetController::class);
    Route::apiResource('/milestone-material-budgets', MilestoneMaterialBudgetController::class);
    Route::apiResource('/milestone-labor-budgets', MilestoneLaborBudgetController::class);
    Route::apiResource('/milestone-sc-budgets', MilestoneScBudgetController::class);

    // Labor Management routes
    Route::apiResource('/labors', LaborController::class);
    Route::apiResource('/labor-categories', LaborCategoryController::class);
});
