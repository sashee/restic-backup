termux_step_make_install() {
	echo "installing!"
	echo "$TERMUX_PKG_SRCDIR"
	ls $TERMUX_PKG_SRCDIR
	echo "=====3"
	echo "=====4"
	echo "$PKGNAME"
	echo "=====5"
	echo "$TERMUX_PKG_NAME"
	ls .
	pwd
	ls -R ./packages/$TERMUX_PKG_NAME
	install -Dm700 8086tiny "$TERMUX_PREFIX"/libexec/8086tiny
	install -Dm600 bios "$TERMUX_PREFIX"/share/8086tiny/bios.bin
	install -Dm600 fd.img "$TERMUX_PREFIX"/share/8086tiny/dos.img
}
