<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/db.php';

try {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    $username = trim((string)($payload['username'] ?? ''));

    if ($username === '') {
        http_response_code(400);
        echo json_encode(['status'=>'error','message'=>'username is required'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $pdo = getPdo();
    $stmt = $pdo->prepare('SELECT id, username, email FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status'=>'error','message'=>'user not found'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $userId = (int)$user['id'];

    // Order counts by status
    $stmt = $pdo->prepare("SELECT status, COUNT(*) AS cnt FROM orders WHERE user_id = ? GROUP BY status");
    $stmt->execute([$userId]);
    $statusCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // Recent orders
    // orders table does not include an order_number column; create a display-friendly order number
    $stmt = $pdo->prepare('SELECT id, CONCAT("ORD", LPAD(id,6,"0")) AS order_number, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
    $stmt->execute([$userId]);
    $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Coupons from schema (no user_id column in current coupons table)
    $stmt = $pdo->prepare("SELECT id, code, CASE WHEN discount_type = 'percentage' THEN discount_value ELSE 0 END AS discount_percent, expiry_date AS expires_at FROM coupons ORDER BY expiry_date ASC LIMIT 5");
    $stmt->execute();
    $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cart count
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE user_id = ?');
    $stmt->execute([$userId]);
    $cartCount = (int)$stmt->fetchColumn();

    // Dashboard home products (explicitly from products table)
    $stmt = $pdo->prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT 12');
    $stmt->execute();
    $recommended = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status'=>'ok',
        'user' => $user,
        'status_counts' => $statusCounts,
        'recent_orders' => $recentOrders,
        'coupons' => $coupons,
        'cart_count' => $cartCount,
        'recommended' => $recommended,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
