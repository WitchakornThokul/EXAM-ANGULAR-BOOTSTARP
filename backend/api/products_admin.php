<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/db.php';

try {
    $pdo = getPdo();
    $method = $_SERVER['REQUEST_METHOD'];
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
        echo json_encode(['status' => 'ok', 'products' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    } elseif ($method === 'POST') {
        $stmt = $pdo->prepare('INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$payload['category_id'] ?? null, $payload['name'], $payload['description'] ?? '', $payload['price'], $payload['image_url'] ?? null]);
        echo json_encode(['status' => 'ok', 'id' => $pdo->lastInsertId()], JSON_UNESCAPED_UNICODE);

    } elseif ($method === 'PUT') {
        $stmt = $pdo->prepare('UPDATE products SET category_id=?, name=?, description=?, price=?, image_url=? WHERE id=?');
        $stmt->execute([$payload['category_id'] ?? null, $payload['name'], $payload['description'] ?? '', $payload['price'], $payload['image_url'] ?? null, $payload['id']]);
        echo json_encode(['status' => 'ok'], JSON_UNESCAPED_UNICODE);

    } elseif ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$payload['id']]);
        echo json_encode(['status' => 'ok'], JSON_UNESCAPED_UNICODE);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}