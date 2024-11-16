export const slugify = (str: string) => {
    str = str.replace(/^\s+|\s+$/g, ''); // Loại bỏ khoảng trắng ở đầu/cuối
    str = str.toLowerCase(); // Chuyển thành chữ thường
    str = str.replace(/[^a-z0-9 -]/g, '') // Xóa ký tự không hợp lệ
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, '-'); // Xóa các dấu gạch ngang liên tiếp
    return str;
};


