<?php
// Simple JSON API for the menu.
// Usage examples:
//   /api/menu.php
//   /api/menu.php?q=dosa
//   /api/menu.php?category=Veg&dietary=veg

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$menuPath = __DIR__ . '/../data/menu.json';
if (!file_exists($menuPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'menu.json not found']);
  exit;
}

$raw = file_get_contents($menuPath);
$data = json_decode($raw, true);
if (!$data || !isset($data['items'])) {
  http_response_code(500);
  echo json_encode(['error' => 'invalid menu.json']);
  exit;
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$dietary = isset($_GET['dietary']) ? trim($_GET['dietary']) : '';

$items = $data['items'];

// Filter
$items = array_values(array_filter($items, function($it) use ($q, $category, $dietary) {
  if ($category !== '' && strcasecmp($category, 'All') !== 0) {
    if (!isset($it['category']) || strcasecmp($it['category'], $category) !== 0) return false;
  }
  if ($dietary !== '' && strcasecmp($dietary, 'all') !== 0) {
    if (!isset($it['dietary']) || strcasecmp($it['dietary'], $dietary) !== 0) return false;
  }
  if ($q !== '') {
    $hay = strtolower(($it['name'] ?? '') . ' ' . ($it['description'] ?? '') . ' ' . implode(' ', $it['tags'] ?? []));
    if (strpos($hay, strtolower($q)) === false) return false;
  }
  return true;
}));

echo json_encode([
  'currency' => $data['currency'] ?? 'GBP',
  'count' => count($items),
  'items' => $items,
], JSON_UNESCAPED_SLASHES);
