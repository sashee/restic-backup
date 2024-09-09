termux_step_make_install() {
	echo "installing!"
	ls
	ls -Rl
	ls -R $TERMUX_PREFIX
	echo "$TERMUX_PKG_SRCDIR"
	ls -R $TERMUX_PKG_SRCDIR
	echo "=====3"
	ls -R /home/builder/termux-packages
	echo "=====4"
	ls -R ./termux-packages/packages
	echo "$PKGNAME"
	ls - R ./packages/$TERMUX_PKG_NAME/*.patch
	ls - R ./packages/$PKGNAME
	echo "=====5"
	echo "$TERMUX_PKG_NAME"
	ls - R ./packages/$TERMUX_PKG_NAME
	install -Dm700 8086tiny "$TERMUX_PREFIX"/libexec/8086tiny
	install -Dm600 bios "$TERMUX_PREFIX"/share/8086tiny/bios.bin
	install -Dm600 fd.img "$TERMUX_PREFIX"/share/8086tiny/dos.img
}
