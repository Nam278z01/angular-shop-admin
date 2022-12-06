export class AdminModel {
  public admin_id: number | null;
  public admin_email: string | null;
  public admin_name: string;
  public gender: number | null;
  public birthday: Date | null;
  public admin_phone: string | null;
  public admin_address: string | null;
  public image: string | null;
  public note: string | null;
  public token_type: string;
  public access_token: string;
}
