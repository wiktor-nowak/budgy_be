export function authorize(allowedRoles) {
    // return (req: Request, res: Response, next: NextFunction): void => {
    //   if (!req.auth?.payload.sub || !req.auth?.payload.sub) {
    //     res
    //       .status(401)
    //       .json({ error: "User not authenticated or role not found." });
    //     return;
    //   }
    //   if (!allowedRoles.includes(req.auth?.payload.sub)) {
    //     res.status(403).json({ error: "Forbidden: Insufficient permissions." });
    //     return;
    //   }
    //   next();
    // };
}
