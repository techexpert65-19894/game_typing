class QuestionsController < ApplicationController
  def index
    @aggregates = Qfile.left_outer_joins(:results).where(user_id: 1).select("qfiles.id, qfiles.title, qfiles.results_count, COUNT(distinct results.user_id) AS count_distinct_results_user_id").group("qfiles.id, qfiles.category, results_count").order("qfiles.id ASC")
  end

  def new
    @qfile = Qfile.new
  end

  def create
    @qfile = Qfile.new(qfile_params)
    if @qfile.save!
      redirect_to root_path
    else
      render :new
    end
  end

  def destroy
    qfile = Qfile.find(params[:id])
    qfile.destroy
  end

  def show
    @qfile = Qfile.find(params[:id]) 
  end

  def play
    # CSV読み込みの部分が長くなってしまった
    require 'csv'
    require 'tempfile'
    
    @qfile = Qfile.find(params[:id])
    # テンポラリファイルを定義。S3からダウンロードして(多分)サーバー上のファイルとして開く。
    file = Tempfile.open
    data = open(@qfile.src.url).read()
    File.open(file, 'wb'){|file| file.write(data)}
    # CSVの中身を保存する配列
    question = []
    CSV.foreach(file, col_sep:"\t", liberal_parsing: true) do |row|
      question << row
    end
    # javascriptに変数を渡す
    gon.question = question
    # いらないかもしれないが、テンポラリファイルを閉じて削除
    file.close
    file.unlink
  end

  def result
    @result = Result.new(result_params)
    respond_to do |format|
      if @result.save
        format.json
      else
        format.json {render :play}
      end
    end
  end

  private

  def qfile_params
    params.require(:qfile).permit(:title, :overview, :category, :src).merge(user_id: current_user.id)
  end

  def result_params
    params.require(:question).permit(:correct_cnt, :wrong_cnt, :elapsed_time, :speed).merge(user_id: current_user.id, qfile_id: params[:id])
  end

end
