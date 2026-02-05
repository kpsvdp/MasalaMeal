<?php
// Minimal contact endpoint.
// This intentionally DOES NOT send email (many hosts block mail()).
// Instead it writes to /data/contact_submissions.log.
// You can swap this for an SMTP provider later.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'POST only']);
  exit;
}

function clean($v) {
  $v = trim((string)$v);
  $v = str_replace(["\r", "\n"], ' ', $v);
  return $v;
}

$name  = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$msg   = clean($_POST['message'] ?? '');

if ($name === '' || $email === '' || $msg === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Missing fields']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid email']);
  exit;
}
if (strlen($msg) > 2000) {
  http_response_code(400);
  echo json_encode(['error' => 'Message too long']);
  exit;
}

$logPath = __DIR__ . '/../data/contact_submissions.log';
$entry = json_encode([
  'ts' => gmdate('c'),
  'name' => $name,
  'email' => $email,
  'message' => $msg,
  'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
], JSON_UNESCAPED_SLASHES) . "\n";

file_put_contents($logPath, $entry, FILE_APPEND | LOCK_EX);

echo json_encode(['ok' => true]);
