# ITenv-Server
# Giải thích các thư mục:

dist: Thư mục chứa các file build
src: Thư mục chứa mã nguồn
src/constants: Chứa các file chứa các hằng số
src/middlewares: Chứa các file chứa các hàm xử lý middleware, như validate, check token, ...
src/controllers: Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response
src/services: Chứa các file chứa method gọi đến database để xử lý logic nghiệp vụ
src/models: Chứa các file chứa các model
src/routes: Chứa các file chứa các route
src/utils: Chứa các file chứa các hàm tiện ích, như mã hóa, gửi email, ...