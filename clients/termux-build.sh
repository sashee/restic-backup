termux_step_make_install() {
	echo "installing!"
	ls
	ls -Rl
	ls -R $TERMUX_PREFIX
	echo "$TERMUX_PKG_SRCDIR"
	ls -R $TERMUX_PKG_SRCDIR
	echo "$PKGNAME"
	install -Dm700 8086tiny "$TERMUX_PREFIX"/libexec/8086tiny
	install -Dm600 bios "$TERMUX_PREFIX"/share/8086tiny/bios.bin
	install -Dm600 fd.img "$TERMUX_PREFIX"/share/8086tiny/dos.img
}
