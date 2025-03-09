export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 bg-white dark:bg-black border-t">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-foreground dark:text-muted-foreground">
          &copy; {currentYear} Teamup Circle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
