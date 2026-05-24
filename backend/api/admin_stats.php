<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/db.php';

try {
    $pdo = getPdo();

    // Total sales this month (delivered)
    $stmt = $pdo->prepare("SELECT IFNULL(SUM(total_amount),0) AS total FROM orders WHERE status = 'delivered' AND MONTH(created_at)=MONTH(CURRENT_DATE()) AND YEAR(created_at)=YEAR(CURRENT_DATE())");
    $stmt->execute();
    $totalSales = $stmt->fetchColumn();

    // New orders (pending or paid)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE status IN ('pending','paid')");
    $stmt->execute();
    $newOrders = (int)$stmt->fetchColumn();

    // Total customers
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'customer'");
    $stmt->execute();
    $totalCustomers = (int)$stmt->fetchColumn();

    // Low stock variants
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM product_variants WHERE stock_quantity < 5");
    $stmt->execute();
    $lowStock = (int)$stmt->fetchColumn();

    // Recent orders requiring action
    // orders table does not have explicit order_number column in this schema;
    // generate a presentable order number from id (e.g. ORD000123)
    $stmt = $pdo->prepare("SELECT id, CONCAT('ORD', LPAD(id,6,'0')) AS order_number, user_id, total_amount, status, created_at FROM orders WHERE status IN ('pending','paid') ORDER BY created_at DESC LIMIT 10");
    $stmt->execute();
    $actionOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recent reviews
    $stmt = $pdo->prepare("SELECT pr.id, pr.product_id, pr.user_id, pr.rating, pr.comment, pr.created_at, p.name AS product_name FROM product_reviews pr LEFT JOIN products p ON pr.product_id = p.id ORDER BY pr.created_at DESC LIMIT 5");
    $stmt->execute();
    $recentReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'ok',
        'kpis' => [
            'total_sales_month' => (float)$totalSales,
            'new_orders' => $newOrders,
            'total_customers' => $totalCustomers,
            'low_stock' => $lowStock,
        ],
        'action_orders' => $actionOrders,
        'recent_reviews' => $recentReviews,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
