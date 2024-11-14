
        document.getElementById('signup-form').addEventListener('submit', function(event) {
            // Lấy giá trị từ các ô nhập
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rePassword = document.getElementById('re_password').value;

            // Ẩn tất cả các thông báo lỗi
            document.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });

            let hasError = false;

            // Kiểm tra từng trường nhập
            if (!name) {
                document.getElementById('nameError').style.display = 'block';
                hasError = true;
            }

            if (!email) {
                document.getElementById('emailError').style.display = 'block';
                hasError = true;
            }

            if (!password) {
                document.getElementById('passwordError').style.display = 'block';
                hasError = true;
            }

            if (!rePassword) {
                document.getElementById('rePasswordError').style.display = 'block';
                hasError = true;
            }

            // Kiểm tra nếu mật khẩu không khớp
            if (password && rePassword && password !== rePassword) {
                document.getElementById('matchPasswordError').style.display = 'block';
                hasError = true;
            }

            // Ngăn form gửi nếu có lỗi
            if (hasError) {
                event.preventDefault();
            }
        });
(function($) {

    $(".toggle-password").click(function() {

        $(this).toggleClass("zmdi-eye zmdi-eye-off");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") == "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });

})(jQuery);
