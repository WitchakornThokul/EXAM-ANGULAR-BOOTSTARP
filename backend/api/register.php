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
    $username = trim((string) ($payload['username'] ?? ''));
    $email = trim((string) ($payload['email'] ?? ''));
    $password = (string) ($payload['password'] ?? '');

    if ($username === '' || $email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'อีเมลไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $pdo = getPdo();

    // ตรวจสอบ username หรือ email ซ้ำ
    $check = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $check->execute([$username, $email]);
    if ($check->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Username หรือ Email นี้ถูกใช้งานแล้ว'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insert = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())');
    $ok = $insert->execute([$username, $email, $passwordHash, 'customer']);

    if (!$ok) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถสร้างบัญชีได้ขณะนี้'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    http_response_code(201);
    echo json_encode(['status' => 'ok', 'message' => 'สมัครสมาชิกสำเร็จ'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
