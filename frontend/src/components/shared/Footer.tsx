export function Footer() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4">
        <div className="footer">
          <aside>
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              B
            </div>
            <p className="text-muted-foreground">
              BlogApp Industries Ltd.
              <br />
              Sharing ideas, one post at a time.
            </p>
          </aside>
          <nav>
            <h6 className="footer-title opacity-100 text-foreground">
              Services
            </h6>
            <a className="link link-hover text-muted-foreground">Branding</a>
            <a className="link link-hover text-muted-foreground">Design</a>
            <a className="link link-hover text-muted-foreground">Marketing</a>
            <a className="link link-hover text-muted-foreground">
              Advertisement
            </a>
          </nav>
          <nav>
            <h6 className="footer-title opacity-100 text-foreground">
              Company
            </h6>
            <a className="link link-hover text-muted-foreground">About us</a>
            <a className="link link-hover text-muted-foreground">Contact</a>
            <a className="link link-hover text-muted-foreground">Jobs</a>
            <a className="link link-hover text-muted-foreground">Press kit</a>
          </nav>
          <nav>
            <h6 className="footer-title opacity-100 text-foreground">Legal</h6>
            <a className="link link-hover text-muted-foreground">
              Terms of use
            </a>
            <a className="link link-hover text-muted-foreground">
              Privacy policy
            </a>
            <a className="link link-hover text-muted-foreground">
              Cookie policy
            </a>
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BlogApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
