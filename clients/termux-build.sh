termux_step_make_install() {
	install -Dm700 8086tiny "$TERMUX_PREFIX"/libexec/8086tiny
	install -Dm600 bios "$TERMUX_PREFIX"/share/8086tiny/bios.bin
	install -Dm600 fd.img "$TERMUX_PREFIX"/share/8086tiny/dos.img
}
