---
title: Cài đặt CLI
description: Cài embra CLI trên Linux và macOS bằng một lệnh, có kiểm chữ ký minisign.
sidebar:
  order: 0
---

```bash
curl -fsSL https://console.embra.cloud/install.sh | sh
```

Script cài `embra` vào `~/.local/bin` (không cần sudo), cho Linux và macOS, amd64 và arm64. Kiểm: `embra --version`.

Nếu shell báo không tìm thấy `embra`, thêm dòng script in ra (`export PATH="$HOME/.local/bin:$PATH"`) vào `~/.bashrc` hoặc `~/.zshrc`.

## Kiểm chữ ký

Mỗi bản phát hành có `checksums.txt` được ký bằng minisign. Script luôn kiểm sha256 của file tải về. Máy có [minisign](https://jedisct1.github.io/minisign/) thì script kiểm thêm chữ ký. Bắt buộc phải có chữ ký (khuyên dùng trong CI):

```bash
curl -fsSL https://console.embra.cloud/install.sh | sh -s -- --require-signature
```

Khoá công khai của Embra:

```
RWRQ+gb11I5WKUICOuDWjHHK6S7qz2OWWqdF4CZX/8M9DQbgKx8Gfb+l
```

Bản phát hành nằm ở [github.com/embra-labs/cli-releases](https://github.com/embra-labs/cli-releases/releases). Tự kiểm tay:

```bash
minisign -Vm checksums.txt -P RWRQ+gb11I5WKUICOuDWjHHK6S7qz2OWWqdF4CZX/8M9DQbgKx8Gfb+l
sha256sum -c --ignore-missing checksums.txt
```

## Tuỳ chọn

| Flag | Biến môi trường | Việc |
|---|---|---|
| `--dir DIR` | `EMBRA_INSTALL_DIR` | Thư mục cài, mặc định `~/.local/bin` |
| `--version VER` | `EMBRA_VERSION` | Cài một version cụ thể |
| `--require-signature` | `EMBRA_REQUIRE_SIGNATURE=1` | Lỗi nếu không kiểm được chữ ký |

Ví dụ: `curl -fsSL https://console.embra.cloud/install.sh | sh -s -- --dir /usr/local/bin --version 0.1.1`.

## Bước tiếp theo

```bash
embra login                 # mở browser để approve
embra up                    # deploy thư mục hiện tại
```

Xem [Danh sách lệnh](/cli/lenh/). Cho AI agent: [AI agent](/huong-dan/ai-agent/).

## Cập nhật và gỡ

- Cập nhật: chạy lại lệnh cài. CLI tự nhắc (tối đa một lần mỗi ngày) khi có bản mới; tắt bằng `EMBRA_NO_UPDATE_CHECK=1`.
- Gỡ: `rm ~/.local/bin/embra`, rồi xoá cấu hình `~/.config/embra/` (có token) và `~/.local/state/embra/`.
