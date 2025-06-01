<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Koneksi
$host = "localhost";
$user = "root";
$pass = "";
$db   = "crudreactnative";
$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Token Auth Sederhana
$API_KEY = "m4rd1best";

// Debug untuk melihat semua parameter yang diterima
error_log("GET params: " . print_r($_GET, true));
error_log("POST params: " . print_r($_POST, true));

// Cek token dari query parameter atau POST data
$token = $_GET['token'] ?? $_POST['token'] ?? '';
error_log("Received token: " . $token);
error_log("Expected token: " . $API_KEY);

if (empty($token) || $token !== $API_KEY) {
    http_response_code(401);
    echo json_encode([
        'error' => 'Unauthorized access',
        // 'debug' => [
        //     'received_token' => $token,
        //     'expected_token' => $API_KEY,
        //     'get_params' => $_GET,
        //     'post_params' => $_POST
        // ]
    ]);
    exit;
}

// Routing
$op = $_GET['op'] ?? '';
switch ($op) {
    case 'create': create(); break;
    case 'detail': detail(); break;
    case 'update': update(); break;
    case 'delete': delete(); break;
    default: normal(); break;
}

// Function: Tampil Semua
function normal(){
    global $koneksi;
    $sql = "SELECT * FROM pegawai ORDER BY id DESC";
    $stmt = mysqli_prepare($koneksi, $sql);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $hasil = [];
    while ($r = mysqli_fetch_assoc($result)) {
        $hasil[] = $r;
    }
    echo json_encode(['data' => ['result' => $hasil]]);
}

// Function: Tambah Data
function create(){
    global $koneksi;
    $nama = $_POST['nama'] ?? '';
    $alamat = $_POST['alamat'] ?? '';
    $hasil = "Gagal dimasukkan data";

    if (empty($nama) || empty($alamat)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nama dan alamat harus diisi']);
        exit;
    }

    $sql = "INSERT INTO pegawai (nama, alamat) VALUES (?, ?)";
    $stmt = mysqli_prepare($koneksi, $sql);
    mysqli_stmt_bind_param($stmt, "ss", $nama, $alamat);
    
    if (mysqli_stmt_execute($stmt)) {
        $hasil = "Berhasil menambahkan data";
    }

    echo json_encode(['data' => ['result' => $hasil]]);
}

// Function: Detail Data
function detail(){
    global $koneksi;
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID tidak valid']);
        exit;
    }

    $sql = "SELECT * FROM pegawai WHERE id = ?";
    $stmt = mysqli_prepare($koneksi, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $hasil = [];
    while ($r = mysqli_fetch_assoc($result)) {
        $hasil[] = $r;
    }

    if (empty($hasil)) {
        http_response_code(404);
        echo json_encode(['error' => 'Data tidak ditemukan']);
        exit;
    }

    echo json_encode(['data' => ['result' => $hasil]]);
}

// Function: Update Data
function update(){
    global $koneksi;
    $id = $_GET['id'] ?? '';
    $nama = $_POST['nama'] ?? '';
    $alamat = $_POST['alamat'] ?? '';
    $hasil = "Gagal melakukan update data";

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID tidak valid']);
        exit;
    }

    if (empty($nama) && empty($alamat)) {
        http_response_code(400);
        echo json_encode(['error' => 'Data tidak boleh kosong']);
        exit;
    }

    $set = [];
    $types = "";
    $params = [];

    if (!empty($nama)) {
        $set[] = "nama = ?";
        $types .= "s";
        $params[] = $nama;
    }
    if (!empty($alamat)) {
        $set[] = "alamat = ?";
        $types .= "s";
        $params[] = $alamat;
    }

    $set[] = "tgl_input = NOW()";
    $sql = "UPDATE pegawai SET " . implode(", ", $set) . " WHERE id = ?";
    $types .= "i";
    $params[] = $id;

    $stmt = mysqli_prepare($koneksi, $sql);
    mysqli_stmt_bind_param($stmt, $types, ...$params);

    if (mysqli_stmt_execute($stmt)) {
        $hasil = "Data berhasil diupdate";
    }

    echo json_encode(['data' => ['result' => $hasil]]);
}

// Function: Hapus Data
function delete(){
    global $koneksi;
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID tidak valid']);
        exit;
    }

    $sql = "DELETE FROM pegawai WHERE id = ?";
    $stmt = mysqli_prepare($koneksi, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    
    if (mysqli_stmt_execute($stmt)) {
        $hasil = "Berhasil menghapus data";
    } else {
        $hasil = "Gagal menghapus data";
    }

    echo json_encode(['data' => ['result' => $hasil]]);
}
?>
